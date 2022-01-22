const googleapis = jest.createMockFromModule('googleapis');
const { people_v1 } = jest.requireActual('googleapis');

function people () {
  return ({
    people: {
      get: () => new Promise(resolve => resolve({
        data: {
          metadata: {
            sources: [
              {
                id: 'test-example-id',
              }
            ]
          },
          names: [
            {
              givenName: 'John',
              familyName: 'Doe',
            }
          ],
          photos: [
            { url: 'https://learnyzen.com/wp-content/uploads/2017/08/test1.png' }
          ],
          emailAddresses: [{ value: 'john_doe@example.com' }]
        }
      }))
    }
  });
}

googleapis.google = { people };
googleapis.people_v1 = people_v1;

module.exports = googleapis;