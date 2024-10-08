export default async function Page() {
  return null;
}

//import {
//  getAllResidentsData,
//  getResidentData,
//  mutateResidentData,
//} from "@/app/admin/residents/data-actions";
//import { GoBackLink } from "@/components/go-back-link";
//import { ResidentForm } from "@/components/residents/form";
//
//export default async function EditResidentPage({
//  params: { id: residentId },
//}: {
//  params: { id: string };
//}) {
//  //TODO: fetch info with id|or pass info through url
//  const {
//    address,
//    name,
//    unit_number,
//    emergency_contacts,
//    emergency_contact_ids,
//  } = await getResidentData(residentId);
//  return (
//    <main className="bg-background container w-full md:w-2/3 mx-auto py-32 max-h-screen">
//      <GoBackLink className="mb-8 cursor-pointer text-blue-700 flex w-full sm:w-3/5 gap-2 sm:gap-5">
//        Go To Previous Page
//      </GoBackLink>
//      <ResidentForm
//        {...{
//          residentId,
//          address,
//          name,
//          unit_number,
//          emergency_contacts,
//          emergency_contact_ids,
//          mutateResidents: mutateResidentData,
//        }}
//      />
//    </main>
//  );
//}
//
//export async function generateStaticParams() {
//  return getAllResidentsData().catch((e) => {
//    throw new Error("Failed To Generate Static Pages -- Tag:20.\n\t" + e);
//  });
//}
