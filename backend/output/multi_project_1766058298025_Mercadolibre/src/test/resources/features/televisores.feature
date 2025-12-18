Feature: Televisores Automation

  Scenario: Escenario exitoso - Buscar televisores
    Given "el usuario navega a la página principal de Mercado Libre"
    When "busca 'televisores' en la barra de búsqueda"
    Then "debe ver una lista de resultados de búsqueda"

  Scenario: Escenario exitoso - Filtrar por marca
    Given "el usuario navega a la página de resultados de búsqueda de televisores"
    When "filtra los resultados por la marca 'Hyundai'"
    Then "debe ver solo los televisores de la marca 'Hyundai'"

  Scenario: Escenario de error - Buscar un producto inexistente
    Given "el usuario navega a la página principal de Mercado Libre"
    When "busca 'televisores que no existen' en la barra de búsqueda"
    Then "debe ver un mensaje de error indicando que no se encontraron resultados"