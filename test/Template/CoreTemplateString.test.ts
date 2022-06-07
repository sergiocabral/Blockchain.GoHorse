import { TemplateString, CoreTemplateString } from '../../ts';
import { HelperText } from '@sergiocabral/helper';

describe('Class: CoreTemplateString', () => {
  beforeEach(() => {
    (
      TemplateString as unknown as Record<string, unknown[]>
    ).instances.length = 0;
  });
  test('Uso de variáveis', () => {
    // Arrange, Given

    const templateString = `data: ${TemplateString.VARIABLE.DATE}`;
    const expectedReplaced = HelperText.replaceAll(
      templateString,
      TemplateString.VARIABLE.DATE,
      new Date().format({ mask: 'y-M-d' })
    );

    // Act, When

    const firstReaded = TemplateString.replace(templateString);
    new CoreTemplateString();
    const secondReaded = TemplateString.replace(templateString);

    // Assert, Then

    expect(firstReaded).toBe(templateString);
    expect(secondReaded).not.toBe(firstReaded);
    expect(secondReaded).toBe(expectedReplaced);
  });
});
