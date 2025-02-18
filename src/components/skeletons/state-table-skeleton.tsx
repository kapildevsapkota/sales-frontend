export function StateTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="w-full">
          <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
            <div className="h-4 w-[80%] animate-pulse rounded bg-muted"></div>
          </td>
          <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
            <div className="h-4 w-[40%] animate-pulse rounded bg-muted"></div>
          </td>
          <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
            <div className="h-4 w-[60%] animate-pulse rounded bg-muted"></div>
          </td>
          <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
            <div className="flex justify-end gap-2">
              <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
              <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
