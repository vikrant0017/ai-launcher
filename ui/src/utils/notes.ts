const SERVER_BASE_URL = "http://localhost:8001"; // TODO get from config
const NOTES_PATH = SERVER_BASE_URL + "/notes";

// Separating out the fetch logic as its a common pattern for JSON request
// Since JSON is the main form of communciaotin in this aapp, this can
// be a genric function for other functions to make api calls
const fetchJson = async (url: string, json: object) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });

  if (response.status == 200) {
    const jsonRes = await response.json();
    return jsonRes;
  } else {
    return null;
  }
};

export interface Note {
  content: string;
  hash: string | null;
  datetime: string | null;
  tags: Array<string> | null;
}

export interface SequenceNote {
  note: Note;
  seq_no: number;
}

// Exposes the api via static methods. SInce the logic is in the server side
// there is no need to create instance, and it only acts like an interface for the http in this
// case, but can be any implemtation behind the scenes
export default class NoteService {
  constructor() {}

  static async save_note(content: string): Promise<SequenceNote | null> {
    const response = await fetchJson(NOTES_PATH + "/write", { content });
    return response;
  }

  static async read_note(seq_no: number = -1): Promise<SequenceNote | null> {
    const response = (await fetchJson(NOTES_PATH + "/read", {
      seq_no,
    })) as SequenceNote;
    return response;
  }
}
