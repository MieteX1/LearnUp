
describe('register user, verify registration, login to account', () => {
  const testEmail = `test${new Date().getTime()}@${Cypress.env("MAILISK_NAMESPACE")}.mailisk.net`;
  const password = Cypress.env("PASSWORD")
  
  it('register user', () => {
    cy.visit('/')
    cy.get('.underline').click()
    cy.get('#login').type('Testowylogin').should('not.have.value', '');
    cy.get('#email').type(testEmail).should('have.value', testEmail);
    cy.get('#password').type(password).should('have.value', password);
    cy.get('#confirmPassword').type(password).should('have.value', password);
    cy.get('.bg-\\[\\#69DC9E\\]').click();
    cy.wait(1500)
    cy.get('.bg-\\[\\#F5F5F5\\] > .text-2xl').contains('Zweryfikuj swój email');
  })
  it('verify registration', () => {
    cy.wait(4000);
    cy.mailiskSearchInbox(Cypress.env("MAILISK_NAMESPACE"),{
    from_timestamp: 0,
  })
  .then((response) =>
   {
    expect(response.data).to.not.be.empty;
    const emails = response.data; 
    const email = emails[0];
    expect(email).to.have.property('html');

    const parser = new DOMParser();
    const doc = parser.parseFromString(email.html, 'text/html')

    const allLinks = [...doc.querySelectorAll('a[href]')];

    const activationLinkElement = allLinks.find(link => link.textContent.includes('Zweryfikuj Email'));

    if(activationLinkElement)
    {
      const activationLink = activationLinkElement.getAttribute('href');
      cy.log(activationLink)
      expect(activationLink).to.not.be.empty;
      
      cy.visit(activationLink);
    }else{
      throw new Error('Activation link not found in the email');
    }
    cy.wait(1000);   
   })
 })
 it('login to account',()=>{
  cy.visit('/');
  cy.get('.justify-between > .flex > [href="/login"]').click();
  cy.get("#email").type(testEmail).should('have.value',testEmail);
  cy.get('#password').type(password).should('have.value',password);
  cy.get('[type="submit"]').click();

  cy.get('.relative > .hover\\:bg-\\[\\#69DC9E\\]\\/20 > .w-6').click()
 })
})