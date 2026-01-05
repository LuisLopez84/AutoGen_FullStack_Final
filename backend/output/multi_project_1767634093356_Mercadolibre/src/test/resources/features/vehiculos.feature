Feature: Vehiculos Automation

  Scenario: Escenario exitoso - Buscar vehículos
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'Vehiculos' en la barra de búsqueda
    Then debe ser redirigido a la página de resultados de búsqueda de vehículos

  Scenario: Escenario exitoso - Filtrar vehículos usados
    Given el usuario navega a la página de resultados de búsqueda de vehículos
    When el usuario selecciona el filtro de 'Usado'
    Then debe ver solo vehículos usados en los resultados

  Scenario: Escenario de error - Buscar un término vacío
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa un término vacío en la barra de búsqueda
    Then debe ver un mensaje de error indicando que debe ingresar un término de búsqueda