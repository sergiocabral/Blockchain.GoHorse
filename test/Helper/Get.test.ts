import { Get, GlobalDefinition } from '../../ts';
import { HelperCryptography } from '@sergiocabral/helper';

describe('Class: Get', () => {
  describe('password', () => {
    test('um valor qualquer não sofre alteração', () => {
      // Arrange, Given

      const input = Math.random().toString();

      // Act, When

      const output = Get.password(input);

      // Assert, Then

      expect(output).toBe(input);
    });
    test('um valor igual a senha padrão deve ser retornada como base64 dos bytes hash sha256', () => {
      // Arrange, Given

      const input = GlobalDefinition.WELL_KNOWN_PASSWORD;
      const expectedOutput = Buffer.from(
        HelperCryptography.hash(input, 'sha256'),
        'hex'
      ).toString('base64');

      // Act, When

      const output = Get.password(input);

      // Assert, Then

      expect(output).not.toBe(input);
      expect(output).toBe(expectedOutput);
    });
  });
});
