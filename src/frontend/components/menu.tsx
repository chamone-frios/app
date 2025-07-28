import { useState } from 'react';

import { Settings } from '@mui/icons-material';
import { IconButton, Menu as MUIMenu, MenuItem } from '@mui/material';
import { Stack } from '@mui/system';

export type MenuProps = {
  id: string;
  items: { label: string; onClick: () => void }[];
};

const Menu = ({ id, items }: MenuProps) => {
  const [dropDownElement, setDropDownElement] = useState<null | HTMLElement>(
    null
  );

  return (
    <Stack
      sx={{
        justifySelf: 'center',
        alignItems: 'center',
        width: 'fit-content',
      }}
    >
      <IconButton
        onClick={(event) =>
          setDropDownElement(dropDownElement ? null : event.currentTarget)
        }
      >
        <Settings fontSize="small" color="primary" />
      </IconButton>
      <MUIMenu
        id={`order-card-menu-${id}`}
        anchorEl={dropDownElement}
        open={Boolean(dropDownElement)}
        onClose={() => setDropDownElement(null)}
        slotProps={{
          list: {
            'aria-labelledby': `order-card-menu-${id}`,
          },
        }}
      >
        {items.map((item) => (
          <MenuItem key={item.label} onClick={item.onClick}>
            {item.label}
          </MenuItem>
        ))}
      </MUIMenu>
    </Stack>
  );
};

export { Menu };
