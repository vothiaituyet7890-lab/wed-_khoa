const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', '..', 'templates', 'html');
const TYPE_MAP = {
  header: 'headers',
  footer: 'footers',
  content: 'content',
};

function ensureDir(type) {
  const folder = TYPE_MAP[type];
  if (!folder) return null;
  const dir = path.join(BASE_DIR, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const customTemplatesController = {
  list: async (req, res) => {
    try {
      const { type } = req.query;
      const dir = ensureDir(type);
      if (!dir) return res.status(400).json({ error: 'type không hợp lệ' });
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
      const data = files.map((name) => {
        const html = fs.readFileSync(path.join(dir, name), 'utf8');
        return { name, html };
      });
      res.json(data);
    } catch (err) {
      console.error('Lỗi khi đọc template:', err);
      res.status(500).json({ error: 'Lỗi khi đọc template' });
    }
  },

  remove: async (req, res) => {
    try {
      const { type, name } = req.params;
      const dir = ensureDir(type);
      if (!dir) return res.status(400).json({ error: 'type không hợp lệ' });
      if (!name) return res.status(400).json({ error: 'Thiếu tên file' });

      const safeName = name.toString().replace(/[^a-z0-9-_.]/gi, '_');
      const filePath = path.join(dir, safeName.endsWith('.html') ? safeName : `${safeName}.html`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File không tồn tại' });
      }
      fs.unlinkSync(filePath);
      res.json({ message: 'Đã xóa template', name: path.basename(filePath) });
    } catch (err) {
      console.error('Lỗi khi xóa template:', err);
      res.status(500).json({ error: 'Lỗi khi xóa template' });
    }
  },

  upload: async (req, res) => {
    try {
      const { type, name, htmlcontent } = req.body;
      if (!type || !name || !htmlcontent) {
        return res.status(400).json({ error: 'Thiếu type, name hoặc htmlcontent' });
      }
      const dir = ensureDir(type);
      if (!dir) return res.status(400).json({ error: 'type không hợp lệ' });
      const safeName = name.toString().replace(/[^a-z0-9-_.]/gi, '_');
      const filePath = path.join(dir, safeName.endsWith('.html') ? safeName : `${safeName}.html`);
      if (fs.existsSync(filePath)) {
        return res.status(409).json({ error: 'Tên file đã tồn tại, vui lòng đổi tên hoặc xóa file cũ.' });
      }
      fs.writeFileSync(filePath, htmlcontent, 'utf8');
      res.status(201).json({ message: 'Đã lưu template', name: path.basename(filePath) });
    } catch (err) {
      console.error('Lỗi khi lưu template:', err);
      res.status(500).json({ error: 'Lỗi khi lưu template' });
    }
  },
};

module.exports = customTemplatesController;
