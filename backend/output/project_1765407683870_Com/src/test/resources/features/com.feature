Feature: Com Automation

  Scenario: Execute recorded flow
    Given I am on the Com page
      "Dado que estoy en la página de Com"
    When I search for a product
      "Cuando busco un producto"
    Then I should see the search results
      "Entonces debo ver los resultados de búsqueda"