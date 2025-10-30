const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(express.static('public'));

app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Télécharger l'archive du projet</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 50px;
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2em;
        }
        .info {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1em;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .file-info {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            color: #555;
        }
        .icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📦</div>
        <h1>Archive du Projet</h1>
        <p class="info">
            Téléchargez l'archive complète de tous les fichiers du projet.
            L'archive exclut les dossiers node_modules, build, et .git.
        </p>
        <a href="/download" class="download-btn">
            ⬇️ Télécharger l'archive
        </a>
        <div class="file-info">
            <strong>Format :</strong> .tar.gz<br>
            <strong>Taille :</strong> ~20 MB
        </div>
    </div>
</body>
</html>
  `;
  res.send(html);
});

app.get('/download', (req, res) => {
  const file = path.join(__dirname, 'project-archive.tar.gz');
  
  if (fs.existsSync(file)) {
    res.download(file, 'project-archive.tar.gz');
  } else {
    res.status(404).send('Archive non trouvée');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur de téléchargement démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📦 Accédez à l'interface pour télécharger l'archive`);
});
