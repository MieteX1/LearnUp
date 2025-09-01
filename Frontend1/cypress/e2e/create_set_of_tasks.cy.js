
describe('create a set of tasks', () => {
  const testEmail = Cypress.env("USER_EMAIL");
  const password = "Qwerty12#4"
  
  
 it('create a set of tasks',()=>{
  cy.visit('/');
  cy.get('.justify-between > .flex > [href="/login"]').click();
  cy.get("#email").type(testEmail).should('have.value',testEmail);
  cy.get('#password').type(password).should('have.value',password);
  cy.get('[type="submit"]').click();

  cy.get('.mr-5').click()
  cy.get('#name').type('testowaNazwa').should('not.have.value','')
  cy.get('#typeId').select('Matematyka')
  cy.get('.px-2').click()
  cy.get('.cursor-grab > .w-full').click().type('Matematyka 1').should('not.have.value', '')
  // zadanie jednokrotkego wyboru
  cy.get('.mb-1').click()
  cy.get(':nth-child(4) > .block').clear().type('zadanie 1')
  cy.get(':nth-child(5) > .block').type('Ile wynosi suma liczb 5 i 8?')
  cy.get('.grid > :nth-child(1) > label > .block').type('12').should('have.value', '12')
  cy.get(':nth-child(2) > label > :nth-child(1)').type('13').should('not.have.value', '')
  cy.get('label > :nth-child(2)').type('16').should('not.have.value', '')
  cy.get('label > :nth-child(3)').type('19').should('not.have.value', '')
  cy.get('.rounded-\\[40px\\] > .flex > .bg-\\[\\#69DC9E\\]').click()
  //zadanie wielokrotnego wyboru
  cy.get('.mb-1').click()
  cy.get('label.mb-2 > .block').select('Test wielokrotnego wyboru')
  cy.get(':nth-child(4) > .block').clear().type('zadanie 2')
  cy.get(':nth-child(5) > .block').type('Które z poniższych liczb są liczbami parzystymi?')
  cy.get('.grid > :nth-child(1) > .px-4').click()
  cy.get('.grid > :nth-child(2) > .px-4').click()
  cy.get('.grid > :nth-child(1) > :nth-child(2) > .block').type(4)
  cy.get('.grid > :nth-child(1) > :nth-child(3) > .block').type(10)
  cy.get(':nth-child(2) > :nth-child(2) > .block').type(7)
  cy.get(':nth-child(2) > :nth-child(3) > .block').type(13)
  cy.get('.rounded-\\[40px\\] > .flex > .bg-\\[\\#69DC9E\\]').click()
  //zadanie otwarte
  cy.get('.mb-1').click()
  cy.get('label.mb-2 > .block').select('Otwarte')
  cy.get(':nth-child(4) > .block').clear().type('zadanie 3')
  cy.get(':nth-child(5) > .block').type('Podaj definicję liczby całkowitej')
  cy.get('.rounded-\\[40px\\] > .flex > .bg-\\[\\#69DC9E\\]').click()
  //zadanie uzupełnij lukę
  cy.get('.mb-1').click()
  cy.get('label.mb-2 > .block').select('Uzupełnij lukę')
  cy.get(':nth-child(3) > .block').select('Trudny')
  cy.get(':nth-child(4) > .block').clear().type('zadanie 4')
  cy.get(':nth-child(5) > .block').type('Liczba pierwsza to liczba naturalna większa od 1, która ma dokładnie _ dzielników.')
  cy.get('.grid > .block').type('dwa').should('have.value','dwa')
  cy.get('.rounded-\\[40px\\] > .flex > .bg-\\[\\#69DC9E\\]').click()
   //zadanie typu fiszki
   cy.get('.mb-1').click()
   cy.get('label.mb-2 > .block').select('Fiszki')
   cy.get(':nth-child(3) > .block').select('Trudny')
   cy.get(':nth-child(4) > .block').clear().type('zadanie 5')
   cy.get('.overflow-y-auto > div > .px-4').click()
   cy.get('[placeholder="Pierwsza strona"]').type('Co to jest funkcja rosnąca')
   cy.get('[placeholder="Druga strona"]').type('Funkcja rosnąca to taka, której wartości zwiększają się wraz ze wzrostem argumentu.')
   cy.get('.rounded-\\[40px\\] > .flex > .bg-\\[\\#69DC9E\\]').click()
  // zadanie dopasowanie
  cy.get('.mb-1').click()
  cy.get('label.mb-2 > .block').select('Dopasowanie')
  cy.get(':nth-child(3) > .block').select('Średni')
  cy.get(':nth-child(4) > .block').clear().type('zadanie 6')
  cy.get(':nth-child(5) > .block').type('Dopasuj odpowiedzi do działań')
  for (let i = 0; i < 4; i++) {
    cy.get('.overflow-y-auto > div > .px-4').click();
  }
  cy.get(':nth-child(2) > [placeholder="Pierwsza część"]').type('7+35')
  cy.get(':nth-child(2) > [placeholder="Druga część"]').type('42')
  cy.get(':nth-child(3) > [placeholder="Pierwsza część"]').type('5×8')
  cy.get(':nth-child(3) > [placeholder="Druga część"]').type('40')
  cy.get(':nth-child(4) > [placeholder="Pierwsza część"]').type('16÷4')
  cy.get(':nth-child(4) > [placeholder="Druga część"]').type('4')
  cy.get(':nth-child(5) > [placeholder="Pierwsza część"]').type('9-4')
  cy.get(':nth-child(5) > [placeholder="Druga część"]').type('5')
  cy.get('.rounded-\\[40px\\] > .flex > .bg-\\[\\#69DC9E\\]').click()
 
  //tworzenie zbioru z dodanymi zadaniami
  cy.get('.px-6').click()
  cy.get('.bg-gray-200').click()
  cy.get('.border-\\[\\#F9CB40\\] > .justify-between.items-center')
 })
})