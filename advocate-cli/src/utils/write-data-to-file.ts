import fs from 'fs';

export function writeDataToFile(
  data: string,
  folderName: string,
  fileName: string
) {
  // Split the folderName into its path segments
  const pathSegments = folderName.split('/');
  let currentPath = '';

  // Create the relevant directory structure if it doesn't already exist
  for (const segment of pathSegments) {
    currentPath = `${currentPath}${segment}/`;

    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }

  // Write the data to the specified file
  fs.writeFileSync(`${currentPath}${fileName}`, data);
}
