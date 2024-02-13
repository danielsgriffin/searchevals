const fs = require('fs');
const path = require('path');

const footerPath = path.join(__dirname, '../components/Footer.tsx');
const fileContents = fs.readFileSync(footerPath, 'utf8');

const updatedContents = fileContents.replace(
    /const lastUpdated = ".*?Z";>/,
    `const lastUpdated = "${new Date().toISOString()}";`
);

fs.writeFileSync(footerPath, updatedContents);