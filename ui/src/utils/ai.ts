
export const ask = async (question: string): Promise<string> => {
  const response = await fetch("http://localhost:8001/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const jsonResponse = await response.json();
  return jsonResponse.response;
}
export const rag = async (question: string): Promise<string> => {
  const response = await fetch("http://localhost:8001/rag", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const jsonResponse = await response.json();
  return jsonResponse.response;
}
