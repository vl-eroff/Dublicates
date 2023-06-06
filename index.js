import * as fs from 'fs';
import * as path from 'path';

const directory = '';
const writeToJson = true;
const moveTo = false;
const remove = false;

function removeDublicates(dublicates) {
    dublicates.forEach(element => {
        fs.unlinkSync(element);
    });
}

function moveDublicates(dublicates) {
    dublicates.forEach(oldPath => {
        fs.renameSync(oldPath, moveTo + path.basename(oldPath));
    });
}

async function findDublicates(dir, dublicates, fileNames) {

    const files = fs.readdirSync(dir);

    for ( const file of files ) {
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

async function main() {
    const dublicates = [];
    const fileNames = {};

    await findDublicates(directory, dublicates, fileNames);

    if (writeToJson) {
        await fs.writeFile("dublicates.json", JSON.stringify(dublicates, null, 2), (err) => {
            if (err) console.error(err)
            else console.log("dublicates.json has been saved");
        });
    }
    if (moveTo) {
        moveDublicates(dublicates);
    }
    if (remove) {
        removeDublicates(dublicates)
    }
    else {
        console.log(dublicates);
    }
}

main();