import { Stack, styled } from '@mui/material';

export const WallPaper = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  alignItems: 'center',
  background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
}));

export const Navbar = styled('nav')(({ theme }) => ({
  display: 'flex',
  width: '80%',
  flex: 0,
  borderRadius: '24px',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(12),
  margin: theme.spacing(4),
  marginBottom: theme.spacing(12),
  padding: theme.spacing(8),
  background: theme.palette.background.paper,
  color: theme.palette.primary.contrastText,

  '& a': {
    textDecoration: 'none',
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
  },

  '& a:hover': {
    color: theme.palette.primary.main,
  },
}));

export const Masrcme = styled(Stack)(({ theme }) => ({
  width: '80%',
  flex: 1,
  borderRadius: '24px',
  borderEndStartRadius: 0,
  borderEndEndRadius: 0,
  padding: theme.spacing(8),
  background: theme.palette.background.paper,
}));
