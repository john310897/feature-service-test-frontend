import { Table } from "react-bootstrap"

const TableComponent = ({ headers, dataList }) => {
    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        {headers?.map((header, index) => (
                            <th key={index + 1}>{header?.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dataList?.map((data, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers?.map((header, colIndex) => (
                                header?.scoped ?
                                    (<td>{header.render(data, rowIndex)}</td>) :
                                    (<td>{data[header?.key]}</td>)
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    )
}
export default TableComponent