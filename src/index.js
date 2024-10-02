const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");

const startButton = document.getElementById("start");
const downloadCheckBox = document.getElementById("d-jdk");
const logs = document.getElementById("logs");
const choosePathButton = document.getElementById("choose-path");
const selectedPathSpan = document.getElementById("selected-path");
let selectedFilePath = "";

choosePathButton.addEventListener("click", async () => {
    const path = await ipcRenderer.invoke('dialog:openDirectory', { properties: ['openDirectory'] });
    if (path) {
        selectedFilePath = path;
        selectedPathSpan.textContent = `Selected Path: ${path}`;
    }
});

function config(filename) {
    const eulaPath = path.join(selectedFilePath, "eula.txt");
    const batchPath = path.join(selectedFilePath, "start.bat");

    fs.writeFileSync(eulaPath, "eula=true", "utf-8");
    fs.writeFileSync(batchPath, `@echo off\njava -jar "${filename}" nogui\npause`, "utf-8");
}

async function download(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.blob();
        fs.writeFileSync(path.join(selectedFilePath, filename), Buffer.from(await data.arrayBuffer()));
        logs.value += `${filename} has been downloaded to ${selectedFilePath}.\n`;
    } catch (error) {
        logs.value += `Fetch error: ${error.message}\n`;
    }
}

startButton.addEventListener("click", async () => {
    startButton.disabled = true;

    if (!selectedFilePath) {
        logs.value += 'Error: No directory selected. Please choose a directory first.\n';
        startButton.disabled = false;
        return;
    }

    logs.value += 'Writing configuration files...\n';

    const urls = [
        "https://download.oracle.com/java/21/archive/jdk-21.0.3_windows-x64_bin.msi",
        "https://api.papermc.io/v2/projects/paper/versions/1.21.1/builds/116/downloads/paper-1.21.1-116.jar"
    ];
    const filenames = [
        "jdk-21.0.3_windows-x64_bin.msi",
        "paper-1.21.1-116.jar"
    ];

    config(filenames[1]);

    if (downloadCheckBox.checked) {
        await download(urls[0], filenames[0]);
    }
    await download(urls[1], filenames[1]);

    startButton.disabled = false;
});
