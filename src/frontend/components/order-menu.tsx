import { useState } from 'react';

import { Settings } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Stack } from '@mui/system';

export type OrderMenuProps = {
  id: string;
  items: { label: string; onClick: () => void }[];
};

const OrderMenu = ({ id, items }: OrderMenuProps) => {
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
      <Menu
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
      </Menu>
    </Stack>
  );
};

export { OrderMenu };
