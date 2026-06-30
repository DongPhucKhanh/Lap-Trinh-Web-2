const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'admin', 'pages');

const filesToUpdate = [
  'Category/CategoryCreate.jsx', 'Category/CategoryEdit.jsx',
  'Brand/BrandCreate.jsx', 'Brand/BrandEdit.jsx',
  'Banner/BannerCreate.jsx', 'Banner/BannerEdit.jsx',
  'Post/PostCreate.jsx', 'Post/PostEdit.jsx'
];

filesToUpdate.forEach(relativePath => {
  const filePath = path.join(basePath, relativePath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already updated
  if (content.includes('uploadService')) return;

  const isEdit = filePath.includes('Edit');

  // 1. Add uploadService import
  content = content.replace(
    /import { Link, useNavigate(.*) } from 'react-router-dom';/,
    "import { Link, useNavigate$1 } from 'react-router-dom';\nimport uploadService from '../../services/uploadService';"
  );

  // 2. Add state variables
  const stateInjection = "  const [imageFile, setImageFile] = useState(null);\n  const [imagePreview, setImagePreview] = useState('');\n";
  content = content.replace(/(const \[formData, setFormData\] = useState\([^)]+\);)/, stateInjection + "$1");

  // 3. For Edit, add preview loading
  if (isEdit) {
    // Some use .then(res => setFormData(res.data))
    content = content.replace(
      /setFormData\(res\.data\);/,
      "setFormData(res.data);\n        if (res.data.image) setImagePreview(uploadService.getImageUrl(res.data.image));"
    );
  }

  // 4. Update handleSubmit
  const newSubmitLogic = `
    try {
      let finalImage = formData.image || '';
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        finalImage = uploadRes.filename;
      }
      const payload = { ...formData, image: finalImage };
`;
  
  // Replace the submit signature to be async
  content = content.replace(/const handleSubmit = \(e\) => \{/, "const handleSubmit = async (e) => {");
  
  // For Category/Brand (which use categoryService.create...)
  // We need to replace the API call block.
  // This is tricky with regex. Let's do it manually via a simpler replace.
  
  const serviceNameMatch = content.match(/(\w+Service)\.(create|update)\(/);
  if (serviceNameMatch) {
    const serviceName = serviceNameMatch[1];
    const isUpdate = serviceNameMatch[2] === 'update';
    
    // Find the block: serviceName.create(formData).then...
    const oldApiCallRegex = new RegExp(`${serviceName}\\.(create|update)\\((.*?formData.*?)\\)[\\s\\S]*?\\.catch\\(err => \\{[\\s\\S]*?\\}\\);`);
    
    const newApiCall = `
      try {
        let finalImage = formData.image || '';
        if (imageFile) {
          const uploadRes = await uploadService.uploadImage(imageFile);
          finalImage = uploadRes.filename;
        }
        const payload = { ...formData, image: finalImage };
        
        await ${serviceName}.${isUpdate ? 'update(id, payload)' : 'create(payload)'};
        setLoading(false);
        navigate('/admin/${relativePath.split('/')[0].toLowerCase()}');
      } catch (err) {
        setLoading(false);
        alert('Lỗi: ' + (err.response?.data?.message || err.response?.data || err.message));
      }
`;
    content = content.replace(oldApiCallRegex, newApiCall.trim());
  }

  // 5. Inject HTML input
  const inputHtml = `
          <div className="form-group">
            <label>Hình ảnh</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }} 
            />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{marginTop: '10px', maxHeight: '100px', borderRadius: '8px'}} />}
          </div>
`;
  // Inject before the submit button's div ("form-actions")
  content = content.replace(/<div className="form-actions">/, inputHtml + '          <div className="form-actions">');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Update complete.');
