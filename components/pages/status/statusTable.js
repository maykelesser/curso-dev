import { Loader } from "@mantine/core";

// Icons
import {
    CheckCircleIcon,
    WrenchScrewdriverIcon,
    ExclamationCircleIcon,
    MinusCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * @function StatusTable
 * @author Maykel Esser
 * @description Status table component.
 * @param {Object} props - Component props
 * @param {Boolean} props.isLoading - Loading status
 * @param {Object} props.data - Data to be displayed
 * @return {JSX.Element} - If loading, it will return a loader. Otherwise, it will return the status table.
 */
export default function StatusTable(props) {
    const { isLoading, data } = props;

    if (isLoading) {
        return <Loader color="yellow"></Loader>;
    }

    return (
        <section className="relative mt-6 overflow-x-auto">
            <div className="border border-gray-200 rounded-lg bg-white">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-6">
                                Status por Serviço
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="flex items-center">
                                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                                        <span className="ml-2">
                                            Sem incidentes
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <WrenchScrewdriverIcon className="w-6 h-6 text-gray-500" />
                                        <span className="ml-2">Manutenção</span>
                                    </div>
                                    <div className="flex items-center">
                                        <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />
                                        <span className="ml-2">Incidente</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MinusCircleIcon className="w-6 h-6 text-red-600" />
                                        <span className="ml-2">
                                            Fora de serviço
                                        </span>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="px-6 py-4 font-semibold">
                                Versão do banco de dados
                            </td>
                            <td className="flex justify-end items-center px-6 py-4">
                                <span className="w-12 rounded-md text-center text-sm bg-green-200 px-3 py-2 text-green-950">
                                    {data.dependencies.database.version}
                                </span>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                            <td className="px-6 py-4 font-semibold">
                                Máximo de conexões permitidas
                            </td>
                            <td className="flex justify-end items-center px-6 py-4">
                                <span className="w-12 rounded-md text-center text-sm bg-green-200 px-3 py-2 text-green-950">
                                    {data.dependencies.database.max_connections}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-semibold">
                                Conexões abertas
                            </td>
                            <td className="flex justify-end items-center px-6 py-4">
                                <span className="w-12 rounded-md text-center text-sm bg-green-200 px-3 py-2 text-green-950">
                                    {
                                        data.dependencies.database
                                            .used_connections
                                    }
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
}
