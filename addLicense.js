#!/usr/bin/env node
const { promises: fs } = require('fs');
const path = require('path');

async function findFiles(dir, extension) {
    let files = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules') continue;
                files = files.concat(await findFiles(fullPath, extension));
            } else if (
                entry.isFile() &&
                path.extname(fullPath) === `.${extension}`
            ) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }
    return files;
}

function normalizeLicenseContent(content) {
    return content
        .trim()
        .replace(/\r\n/g, '\n') // Normalize line endings
        .split('\n')
        .map((line) => line.trim().replace(/^\*/, '').trim())
        .join('\n')
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n');
}

async function prependContentToFiles(
    rootDirectory,
    contentFile,
    fileExtension
) {
    try {
        const content = await fs.readFile(contentFile, 'utf8');
        const comment = `/*\n${content}\n*/\n\n`;

        // Create normalized version for comparison
        const licenseNormalized = normalizeLicenseContent(content);

        const files = await findFiles(rootDirectory, fileExtension);
        if (files.length === 0) {
            console.log('No matching files found.');
            return;
        }

        for (const file of files) {
            try {
                const existingContent = await fs.readFile(file, 'utf8');

                // Check for existing license using more sophisticated detection
                const existingHeaderMatch =
                    existingContent.match(/^\/\*[\s\S]*?\*\//);
                let hasExistingLicense = false;

                if (existingHeaderMatch) {
                    const existingHeader = existingHeaderMatch[0];
                    const existingNormalized = normalizeLicenseContent(
                        existingHeader
                            .replace(/^\/\*+/, '')
                            .replace(/\*+\/$/, '')
                    );

                    // Compare normalized content
                    hasExistingLicense =
                        existingNormalized === licenseNormalized;
                }

                if (!hasExistingLicense) {
                    await fs.writeFile(file, comment + existingContent);
                    console.log(`Prepended content to ${file}`);
                } else {
                    console.log(
                        `Valid license header already exists in ${file}, skipping.`
                    );
                }
            } catch (error) {
                console.error(`Error processing file ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

prependContentToFiles('./', './LICENSE.md', 'ts');
