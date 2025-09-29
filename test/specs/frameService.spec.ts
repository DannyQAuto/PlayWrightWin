import { test, expect } from '@playwright/test';

test('POST a frameService debería responder con status 200', async ({ request }) => {
  const response = await request.post(
    'http://10.1.3.23/frameservice/php/apps/job/logic/logwincrm.php'
  );

  // Verificar que el status sea 200
  expect(response.status()).toBe(200);

  // Verificar que la respuesta contenga "termino"
  const responseText = await response.text();
  expect(responseText).toContain('termino');
});