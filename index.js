import * as fs from 'fs';
import * as path from 'path';

async function findDublicates(dir, dublicates, fileNames) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (file.startsWith('.')) continue;

        const filePath = path.join(dir, file);
        const fileName = path.parse(file).name;

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            await findDublicates(filePath, dublicates, fileNames);
        } else {
            if (fileNames[fileName]) {
                if (fileNames[fileName].size === stats.size) {
                    dublicates.push(filePath);
                }
            } else {
                fileNames[fileName] = stats;
            }
        }
    }
}

function writeToJsonDublicates(dublicates) {
    fs.writeFileSync("dublicates.json", JSON.stringify(dublicates, null, 2));
    console.log('dublicates.json has been saved');
}

function removeDublicates(dublicates) {
    dublicates.forEach(element => {
        fs.unlinkSync(element);
    });
}

function moveDublicates(dublicates, moveto) {
    dublicates.forEach(oldPath => {
        fs.renameSync(oldPath, moveto + path.basename(oldPath));
    });
}

async function main() {
    if (process.argv.length == 2) {
        console.error('Expected at least one argument');
        process.exit(1);
    }

    const _arguments = process.argv.slice(2);

    const directory = (_arguments[0] || './');
    console.log(`Selected directory: ${directory}`);

    const dublicates = [];
    const fileNames = {};

    await findDublicates(directory, dublicates, fileNames);

    if (_arguments.indexOf('json') > -1) {
        writeToJsonDublicates(dublicates);
    }
    if (_arguments.indexOf('rm') == -1 && _arguments.indexOf('moveto') > -1) {
        const moveto = _arguments[_arguments.indexOf('moveto') + 1];
        if (moveto) {
            moveDublicates(dublicates, moveto);
        } else {
            console.error("Expected moveto path");
        }
    }
    if (_arguments.indexOf('rm') > -1) {
        removeDublicates(dublicates);
    }
    else {
        console.log(dublicates);
    }
}

main();