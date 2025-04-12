document.addEventListener('DOMContentLoaded', async () => {
  const dirPathInput = document.getElementById('dirPath');
  const depthLimitInput = document.getElementById('depthLimit');
  const printOptionCheckbox = document.getElementById('printOption');
  const browseBtn = document.getElementById('browseBtn');
  const generateBtn = document.getElementById('generateBtn');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const headerInfo = document.getElementById('header-info');
  const treeOutput = document.getElementById('tree-output');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  
  let currentDirectoryTree = [];

  depthLimitInput.addEventListener('input', function() {
    let value = this.value;
    if (value === '') return;
    
    value = parseInt(value);
    if (isNaN(value) || value < 1) {
      this.value = 1;
    } else {
      this.value = value;
    }
  });

  function updateStatus(isActive, message) {
    if (isActive) {
      statusIndicator.classList.remove('bg-gray-400');
      statusIndicator.classList.add('status-active');
      generateBtn.disabled = true;
      generateBtn.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
      statusIndicator.classList.remove('status-active');
      statusIndicator.classList.add('bg-gray-400');
      generateBtn.disabled = false;
      generateBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
    statusText.textContent = message;
  }

  function updateHeaderInfo(dirPath, depthLimit) {
    headerInfo.textContent = `Directory: ${dirPath}\nDepth Limit: ${depthLimit}`;
  }

  function updateTreeOutput(treeLines) {
    treeOutput.textContent = treeLines.join('\n');
  }

  function clearOutputs() {
    headerInfo.textContent = '';
    treeOutput.textContent = '';
  }

  clearBtn.addEventListener('click', () => {
    clearOutputs();
    currentDirectoryTree = [];
    updateStatus(false, 'Output cleared');
  });

  copyBtn.addEventListener('click', () => {
    if (treeOutput.textContent) {
      navigator.clipboard.writeText(treeOutput.textContent)
        .then(() => {
          updateStatus(true, 'Tree copied to clipboard');
          setTimeout(() => {
            updateStatus(true, 'Directory tree generated successfully');
          }, 2000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          updateStatus(false, 'Failed to copy');
        });
    } else {
      updateStatus(false, 'Nothing to copy');
    }
  });

  browseBtn.addEventListener('click', async () => {
    try {
      const selectedPath = await window.electronAPI.selectDirectory();
      if (selectedPath) {
        dirPathInput.value = selectedPath;
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      updateStatus(false, 'Error selecting directory');
    }
  });

  generateBtn.addEventListener('click', async () => {
    const dirPath = dirPathInput.value.trim();
    if (!dirPath) {
      alert('Please select a directory first');
      return;
    }

    const depthLimit = parseInt(depthLimitInput.value);
    if (isNaN(depthLimit) || depthLimit < 1) {
      alert('Please enter a valid depth limit (must be at least 1)');
      depthLimitInput.value = 1;
      depthLimitInput.focus();
      return;
    }

    clearOutputs();
    updateStatus(true, 'Generating directory tree...');

    try {
      updateHeaderInfo(dirPath, depthLimit);

      const shouldPrint = printOptionCheckbox.checked;
      currentDirectoryTree = await window.electronAPI.getDirectoryTree(dirPath, depthLimit);
      
      if (currentDirectoryTree.error) {
        treeOutput.textContent = `Error: ${currentDirectoryTree.error}`;
        updateStatus(false, 'Error generating tree');
        return;
      }

      if (shouldPrint && Array.isArray(currentDirectoryTree) && currentDirectoryTree.length > 0) {
        updateTreeOutput(currentDirectoryTree);
        updateStatus(true, 'Directory tree generated successfully');
      } else if (Array.isArray(currentDirectoryTree) && currentDirectoryTree.length === 0) {
        treeOutput.textContent = 'No files or directories found at this depth level.';
        updateStatus(false, 'Empty directory');
      } else {
        treeOutput.textContent = 'Unknown error occurred';
        updateStatus(false, 'Error generating tree');
      }
    } catch (error) {
      treeOutput.textContent = `Error: ${error.message}`;
      updateStatus(false, 'Error generating tree');
    }
  });

  saveBtn.addEventListener('click', async () => {
    if (currentDirectoryTree.length === 0 && !treeOutput.textContent) {
      alert('Please generate a directory tree first');
      return;
    }

    updateStatus(true, 'Saving to file...');
    
    const headerText = headerInfo.textContent || '';
    const treeText = treeOutput.textContent || '';
    const content = headerText + '\n\n' + treeText;
    
    try {
      const fileName = dirPathInput.value.split(/[\\/]/).pop() || 'directory';
      const result = await window.electronAPI.saveToFile(content, `${fileName}_tree.txt`);
      
      if (result.success) {
        updateStatus(true, `Saved to ${result.path}`);
      } else if (!result.canceled) {
        updateStatus(false, `Error saving file: ${result.error}`);
      } else {
        updateStatus(false, 'Save canceled');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      updateStatus(false, `Error saving file: ${error.message}`);
    }
  });

  try {
    const lastDirectory = await window.electronAPI.getLastDirectory();
    if (lastDirectory) {
      dirPathInput.value = lastDirectory;
    }
  } catch (error) {
    console.error('Error loading last directory:', error);
  }

  updateStatus(false, 'Ready');
}); 