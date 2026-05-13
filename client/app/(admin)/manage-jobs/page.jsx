import ManageJobsClient from "./ManageJobsClient";
export default async function ManageJobsPage({ searchParams }) {
    const params = (await searchParams) ?? {};
    const approvalStatus = Array.isArray(params.approval_status)
        ? params.approval_status[0]
        : params.approval_status;
    return <ManageJobsClient initialApprovalFilter={approvalStatus}/>;
}
