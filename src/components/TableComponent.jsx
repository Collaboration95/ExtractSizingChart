// const TableComponent = ({ tableData }) => {
//   if (!tableData || tableData.length === 0) {
//     return <div>No data available</div>;
//   }

//   return (
//     <>
//       {tableData.map((row, rowIndex) => {
//         return (
//           <table
//             key={rowIndex}
//             style={{
//               borderCollapse: "collapse",
//               width: "100%",
//               marginTop: "10px",
//               marginBottom: "10px",
//             }}
//           >
//             <thead>
//               <tr>
//                 {row.data[0].map((element, index) => (
//                   <th
//                     key={index}
//                     style={{ border: "1px solid black", padding: "8px" }}
//                   >
//                     {element}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {row.data.slice(1).map((rowItem, rowItemIndex) => (
//                 <tr key={rowItemIndex}>
//                   {rowItem.map((cell, cellIndex) => (
//                     <td
//                       key={cellIndex}
//                       style={{ border: "1px solid black", padding: "8px" }}
//                     >
//                       {cell}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         );
//       })}
//     </>
//   );
// };

// export default TableComponent;
const TableComponent = ({ tableData, titlesData }) => {
  if (!tableData || tableData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <>
      {titlesData && titlesData.length > 0 && (
        <div>
          <h3>Table Titles:</h3>
          <ul>
            {titlesData.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ul>
        </div>
      )}

      {tableData.map((row, rowIndex) => {
        return (
          <table
            key={rowIndex}
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            <thead>
              <tr>
                {row.data[0].map((element, index) => (
                  <th
                    key={index}
                    style={{ border: "1px solid black", padding: "8px" }}
                  >
                    {element}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {row.data.slice(1).map((rowItem, rowItemIndex) => (
                <tr key={rowItemIndex}>
                  {rowItem.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{ border: "1px solid black", padding: "8px" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
    </>
  );
};
export default TableComponent;