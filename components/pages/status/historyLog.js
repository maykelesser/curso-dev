// Icons
import { CheckCircleIcon } from "@heroicons/react/24/outline";

/**
 * @function HistoryLog
 * @author Maykel Esser
 * @description History log component.
 * @return {JSX.Element} - Full status table component with all needed data
 */
export default function HistoryLog() {
    return (
        <section className="mt-6 w-full">
            <hr className="my-8" />
            <h2 className="text-lg font-bold">Histórico de incidentes</h2>
            <div className="mt-4">
                <ul className="text-sm text-gray-500">
                    <li className="flex items-center gap-2">
                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                        <span>Tudo limpo!</span>
                    </li>
                </ul>
            </div>
        </section>
    );
}
