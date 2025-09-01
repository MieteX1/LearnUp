
describe('solving a set of tasks', () => {
  const testEmail = Cypress.env("USER_EMAIL");
  const password = "Qwerty12#4"
  
  
 it('solving a set of tasks',()=>{
  //logowanie
  cy.viewport(1920, 1080)
  cy.visit('/');
  cy.get('.justify-between > .flex > [href="/login"]').click();
  cy.get("#email").type(testEmail).should('have.value',testEmail);
  cy.get('#password').type(password).should('have.value',password);
  cy.get('[type="submit"]').click();
  //wyszukiwanie zbioru po nazwie
  cy.get('.bg-\\[\\#F5F5F5\\] > .flex-1').type('testowaNazwa')
  cy.get('.bg-\\[\\#F5F5F5\\] > :nth-child(1) > .w-6').click()
  //przechodzenie do rozwiązywania zbioru
  cy.get('.text-white').click()
  cy.get('.md\\:w-auto').click()
  cy.get('.text-left > :nth-child(1) > .flex').click()
  //rozwiązywanie zbioru
  //zadanie 1
  cy.get('.w-1\\/2 > .justify-center > :nth-child(3)').click()
  cy.get('.bg-blue-500').click()
  //zadanie 2
  cy.get('.text-left > :nth-child(2) > .flex').click()
  cy.get('.w-1\\/2 > .justify-center > :nth-child(2)').click()
  cy.get('.w-1\\/2 > .justify-center > :nth-child(4)').click()
  cy.get('.bg-blue-500').click()
  //zadanie 3
  cy.get('.text-left > :nth-child(3) > .flex').click()
  cy.get('.w-3\\/4').type("Testowa odpowiedź na zadanie otwarte")
  cy.get('.bg-blue-500').click()
  //zadanie 4
  cy.get('.text-left > :nth-child(4) > .flex').click()
  cy.get('.border').type("dwa")
  cy.get('.bg-blue-500').click()
   //zadanie 5
   cy.get('.text-left > :nth-child(5) > .flex').click()
   cy.get('.h-80').click()
   cy.get('.mt-4 > :nth-child(2)').click()
  //zadanie 6
  cy.get('.text-left > :nth-child(6) > .flex').click()
  cy.get('.grid > :nth-child(1) > :nth-child(1)').click()
  cy.get('.grid > :nth-child(2) > :nth-child(2)').click()
  cy.get('.grid > :nth-child(1) > :nth-child(2)').click()
  cy.get('.grid > :nth-child(2) > :nth-child(1)').click()
  cy.get('.grid > :nth-child(1) > :nth-child(3)').click()
  cy.get('.grid > :nth-child(2) > :nth-child(4)').click()
  cy.get('.grid > :nth-child(1) > :nth-child(4)').click()
  cy.get('.grid > :nth-child(2) > :nth-child(3)').click()
  cy.get('.bg-blue-500').click()
 
  // podgląd postępu w zbiorze
  cy.get('.mt-2').click()
 })
})