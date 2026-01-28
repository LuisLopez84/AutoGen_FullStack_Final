import React from 'react';
// Hemos actualizado las importaciones para incluir los componentes que usas (Box, Typography, Card, etc.)
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Link
} from '@mui/material';

// Importamos los iconos necesarios para el diseño
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import FolderIcon from '@mui/icons-material/Folder';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GitHubIcon from '@mui/icons-material/GitHub';

const PlaywrightBDDPOM = () => {

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', p: 2 }}>

      {/* TÍTULO DE LA PESTAÑA */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#2196F3', width: 56, height: 56 }}>
          <PlayCircleIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 'bold' }}>
            PlayWright BDD POM
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Template de Automatización Profesional
          </Typography>
        </Box>
      </Box>

      {/* TARJETA PRINCIPAL: Estructura y Características */}
      <Card variant="outlined" sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon color="primary" />
            Estructura del Proyecto
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List>
            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}><CodeIcon /></Avatar>
              </ListItemIcon>
              <ListItemText
                primary="Patrón de Diseño Page Object Model (POM)"
                secondary="Separación clara entre lógica de test y selectores de página."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}><DescriptionIcon /></Avatar>
              </ListItemIcon>
              <ListItemText
                primary="Integración BDD con Cucumber"
                secondary="Archivos .feature legibles y definiciones de pasos en Java."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#ef6c00' }}><PlayCircleIcon /></Avatar>
              </ListItemIcon>
              <ListItemText
                primary="Playwright con Java"
                secondary="Motor de automatización moderno y rápido soportado por Microsoft."
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* SECCIÓN: INFORMACIÓN ADICIONAL (Estilo Guía) */}
      <Card
        variant="outlined"
        sx={{
          backgroundColor: '#f8f9fa', // Fondo gris suave estilo "Guía"
          borderLeft: '4px solid #2196F3', // Borde lateral de color
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon /> Información Adicional
          </Typography>

          <Typography variant="body2" paragraph sx={{ color: '#424242' }}>
            Este template está diseñado para proyectos de automatización enterprise-ready.
            Incluye configuración para reportes, ejecución paralela y gestión de datos.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip label="Java 11+" size="small" color="primary" variant="outlined" />
            <Chip label="Maven" size="small" color="secondary" variant="outlined" />
            <Chip label="Allure Reports/html-Video" size="small" color="success" variant="outlined" />
            <Chip label="Cucumber BDD" size="small" color="default" variant="outlined" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Puedes revisar la documentación oficial y el código fuente en el repositorio:
            </Typography>
            <Link
              href="https://github.com/LuisLopez84/Template_PlayWright_BDD_POM"
              target="_blank"
              variant="button"
              startIcon={<GitHubIcon />}
              sx={{ textTransform: 'none', fontWeight: 'bold', color: '#1565c0' }}
            >
              Ver Repositorio en GitHub
            </Link>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
};

export default PlaywrightBDDPOM;