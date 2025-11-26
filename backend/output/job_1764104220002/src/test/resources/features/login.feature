Feature: Login Feature

  Scenario: Successful login
    Given the user is on the login page
    When the user enters username and password
    Then the user should be logged in

  Scenario Outline: Login with different credentials
    Given the user is on the login page
    When the user enters <username> and <password>
    Then the user should be logged in

    Examples:
      | username | password |
      | Admin    | admin123 |
      | User     | user123  |
