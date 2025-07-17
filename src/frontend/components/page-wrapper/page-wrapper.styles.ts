import { Stack, styled } from '@mui/material';

export const WallPaper = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  width: '100dvw',
  alignItems: 'center',
  background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
}));

export const Navbar = styled('nav')(({ theme }) => ({
  display: 'flex',
  width: '90%',
  flex: 0,
  borderRadius: theme.spacing(5),
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(6),
  margin: theme.spacing(4),
  marginBottom: theme.spacing(8),
  padding: theme.spacing(5),
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

export const Main = styled(Stack)(({ theme }) => ({
  width: '90%',
  flex: 1,
  borderRadius: theme.spacing(5),
  borderEndStartRadius: 0,
  borderEndEndRadius: 0,
  padding: theme.spacing(5),
  background: theme.palette.background.paper,
}));
