import { StatementApiResponse } from "@/types/statements";
import StatementTable from "./statement-table";

type Props = {
  data: StatementApiResponse;
};

export default function StatementView({ data }: Props) {
  return <StatementTable data={data} />;
}
