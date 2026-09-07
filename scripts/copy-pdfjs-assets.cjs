// pdfjs-dist's own build is itself a webpack bundle that collides with our webpack's internal
// runtime variable names under Next.js's dev-mode eval-wrapping (webpack/webpack#20095, not yet
// fixed in Next's bundled webpack). We load it natively in the browser instead of bundling it, so
// it must live under /public as a static file, copied fresh from node_modules on every install.
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build');
const targetDir = path.join(__dirname, '..', 'public', 'pdfjs');

fs.mkdirSync(targetDir, { recursive: true });
for (const fileName of ['pdf.min.mjs', 'pdf.worker.min.mjs']) {
  fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
}
console.log('Copied pdfjs-dist browser assets to public/pdfjs/');
