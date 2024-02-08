import { console_log } from '../../console_log';

export const propertyNValueCorrector = async (
  property2Use: string,
  value: string
): Promise<string> => {
  console_log.consoleLog('info', {
    property2Use: property2Use,
    value: value,
  });
  let newRule = `${
    ['background-color', 'color'].includes(property2Use) &&
    value.includes('gradient')
      ? 'background-image'
      : property2Use === 'border-color' && value.includes('gradient')
      ? `border-image-source`
      : property2Use
  }:${value};${
    property2Use === 'color' && value.includes('gradient')
      ? `background-clip: text;background-size: 100%;-webkit-background-clip: text;-moz-background-clip: text;-webkit-text-fill-color: transparent;-moz-text-fill-color: transparent;`
      : property2Use === 'border-color' && value.includes('gradient')
      ? `border-image-slice:1;border-image-width:2px;`
      : ''
  }`;
  console_log.consoleLog('info', { newRule: newRule });
  return newRule;
};
