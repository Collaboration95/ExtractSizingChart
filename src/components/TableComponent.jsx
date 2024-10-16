import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  List,
  ListItem
} from '@mui/material';

const TableComponent = ({ tableData, titlesData, tableInfo }) => {
  if (!tableData || tableData.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <>
      {tableInfo && tableInfo.map(({ tables, titles }, index) => (
        <Box key={index} mb={4}>
          {titles && titles.length > 0 ? (
            <List>
              {titles.map((title, index) => (
                <ListItem key={index}>
                  <Typography variant="h6"  >{title}</Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="h6" color="textSecondary">
              No title recognized
            </Typography>
          )}

          {tables.map((row, rowIndex) => (
            <Table key={rowIndex} sx={{ mt: 2, mb: 2, width: '100%', border: 1 }}>
              <TableHead>
                <TableRow sx={{
                   '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
                }}>
                  {row.data[0].map((element, index) => (
                    <TableCell key={index}
                    sx={{
                      fontWeight: 'bold',
                      borderBottom: 1,
                     
                    }}
                     >
                      {element}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {row.data.slice(1).map((rowItem, rowItemIndex) => (
                  <TableRow key={rowItemIndex} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' }}}>
                    {rowItem.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} sx={{ borderBottom: 1 }}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))}
        </Box>
      ))}
    </>
  );
};

export default TableComponent;

