import { getAddresses } from "@/actions/customer/address.actions";
import { AddressManagementClient } from "@/components/custom/customer/address/address-management-client";

export default async function AddressesPage() {
  const result = await getAddresses();
  const addresses = "error" in result ? [] : result;
  return <AddressManagementClient initialAddresses={addresses} />;
}
