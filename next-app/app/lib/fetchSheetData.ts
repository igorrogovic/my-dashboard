export async function fetchSheetData() {
  try {
    // Your fetch logic here
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}
