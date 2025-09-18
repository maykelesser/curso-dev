import { Skeleton } from "@mantine/core";

/**
 * @function UpdatedAt
 * @author Maykel Esser
 * @description "Updated at" component. It shows the last time the data was updated.
 * @param {Object} props - Component props
 * @param {Boolean} props.isLoading - Loading status
 * @param {Object} props.data - Data to be displayed
 * @return {JSX.Element} - If loading, it will return a skeleton. Otherwise, it will return the updated at date.
 */
export default function UpdatedAt(props) {
    const { isLoading, data } = props;

    if (isLoading || !data) {
        return <Skeleton height={22}></Skeleton>;
    }

    return (
        <section className="mb-10">
            <p className="text-gray-500">
                Última atualização em: {data.updated_at}
            </p>
        </section>
    );
}
