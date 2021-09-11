'use strict'

const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
    
    console.log('Text watermark was added successfully!');
    startApp();
  }
  catch(error) {
    console.log('Something went wrong... Try again');
  }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);

    console.log('Image watermark was added successfully!');
    startApp();
  }
  catch(error) {
    console.log('Something went wrong... Try again');
  }
};

const prepareOutputFilename = (filename) => {
  const name = filename.split('.');
  return (`${name[0]}-with-watermark.${name[1]}`);

  // const [ name, ext ] = filename.split('.');
  // return `${name}-with-watermark.${ext}`;
}

const prepareEditedFileName = (filename, option) => {
  const name = filename.split('.');
  return (`${name[0]}-edited-${option}.${name[1]}`);
}; 

const makeImageBrighter = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
    process.stdout.write('Choose value from (decrease brightness) -1 to 1 (increase brightness)');

    process.stdin.on('readable', () => {
      const input = process.stdin.read();
      const instruction = input.toString().trim();
      
      image.brightness(instruction).writeAsync(outputFile);
      console.log('Image brightness was changed successfully!');
    })
  
  } catch(error) {
    console.log('Something went wrong... Try again');
  }
};

const increaseImageContrast = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
    process.stdout.write('Choose value from (decrease brightness) -1 to +1 (increase brightness)');

    process.stdin.on('readable', () => {
      const input = process.stdin.read();
      const instruction = input.toString().trim();
      
      image.contrast(instruction).writeAsync(outputFile);
      console.log('Image contrast was changed successfully!');
    })
  
  } catch(error) {
    console.log('Something went wrong... Try again');
  }
};

const makeImageBlackWhite = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
      
    await image.greyscale().writeAsync(outputFile);
    console.log('Image changed made black&white successfully!');
  
  } catch(error) {
    console.log('Something went wrong... Try again');
  }
};

const invertImage = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
    process.stdout.write('Choose between: flip, mirror and rotate');

    process.stdin.on('readable', () => {
      const input = process.stdin.read();
      const instruction = input.toString().trim();
      if(instruction === 'flip'){
        process.stdout.write('Choose between: horizontally (hortz) and vertically (vert)');
        process.stdin.on('readable', () => {
          const input = process.stdin.read();
          const val = input.toString().trim();
          image.flip(val).writeAsync(outputFile);
        })

      } else if(instruction === 'mirror'){
        process.stdout.write('Choose between: horizontally (hortz) and vertically (vert)');
        process.stdin.on('readable', () => {
          const input = process.stdin.read();
          const val = input.toString().trim();
          image.mirror(val).writeAsync(outputFile);
        })
      } else  if(instruction === 'rotate'){
        process.stdout.write('Write a number of degress to rotate the image clockwise');
        process.stdin.on('readable', () => {
          const input = process.stdin.read();
          const val = input.toString().trim();
          image.rotate(val).writeAsync(outputFile);
        })
      }
      
      console.log('Image was inverted successfully!');
    })

  } catch(error) {
    console.log('Something went wrong... Try again');
  }
}

const collectInputs = async (inputs = []) => {
  const options = [
    {
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    }, 
    {
      name: 'fileEdition',
      message: 'Do you want to modify the file?',
      type: 'confirm',
      default: true
    }, 
    {
      name: 'editionOption',
      type: 'list',
      choices: ['Make image brighter', 'Increase contrast', 'Make image b&w', 'Invert image'],
    }, 
    {
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    }
  ];

  const { again, ...answers } = await inquirer.prompt(options);
  const newInputs = [...inputs, answers];
  return again ? collectInputs(newInputs) : newInputs;
}


const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([
    {
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }
  ]);

  // if answer is no, just quit the app
  if(!answer.start) process.exit();

  // ask about input file and watermark type
  const inputs = await collectInputs();

  if(inputs.options.editionOption === 'Make image brighter'){
    makeImageBrighter(`./img/${inputs.options.inputImage}`, `./img/${prepareEditedFileName(inputs.options.inputImage, inputs.options.editionOption)}`,);
  } else if(inputs.options.editionOption === 'Increase contrast'){
    increaseImageContrast(`./img/${inputs.options.inputImage}`, `./img/${prepareEditedFileName(inputs.options.inputImage, inputs.options.editionOption)}`,);
  } else if(inputs.options.editionOption === 'Make image b&w'){
    makeImageBlackWhite(`./img/${inputs.options.inputImage}`, `./img/${prepareEditedFileName(inputs.options.inputImage, inputs.options.editionOption)}`,);
  } else {
    invertImage(`./img/${inputs.options.inputImage}`, `./img/${prepareEditedFileName(inputs.options.inputImage, inputs.options.editionOption)}`,);
  }

  if(inputs.options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }])
    inputs.options.watermarkText = text.value;

    if(fs.existsSync(`./img/${inputs.options.inputImage}`)){
      addTextWatermarkToImage(`./img/${inputs.options.inputImage}`, `./img/${prepareOutputFilename(inputs.options.inputImage)}`, inputs.options.watermarkText);
    } else {
      console.log('Something went wrong... Try again');
    }
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.png',
    }])
    inputs.options.watermarkImage = image.filename;

    if(fs.existsSync(`./img/${inputs.options.inputImage}`) && fs.existsSync('./img/' + image.filename)){
      addImageWatermarkToImage(`./img/${inputs.options.inputImage}`, `./img/${prepareOutputFilename(inputs.options.inputImage)}`, `./img/${inputs.options.watermarkImage}`);
    } else {
      console.log('Something went wrong... Try again');
    }
  }
};

startApp();