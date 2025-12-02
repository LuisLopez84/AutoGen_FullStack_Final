Feature: OrangeHRM Automation
          Scenario: Login and search user
            Given I open the OrangeHRM application
            When I login with username "Admin" and password "admin123"
            And I navigate to Admin section
            And I search for user "Test User"
            Then I should see search results