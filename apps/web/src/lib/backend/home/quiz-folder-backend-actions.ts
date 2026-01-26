import axios from 'axios';
import {
    CREATE_FOLDER_URL,
    DELETE_FOLDER_URL,
    GET_FOLDER_QUIZ_URL,
    GET_QUIZ_FOLDERS_URL,
    UPDATE_FOLDER_URL,
} from 'routes/api_routes';

export default class QuizFolderBackendActions {
    static async create_folder(token: string, name: string) {
        if (!token || !name) {
            console.error('Insufficient data');
            return;
        }

        try {
            const { data } = await axios.post(
                CREATE_FOLDER_URL,
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (data.success) {
                return data.data;
            }
        } catch (error) {
            console.error('Error in creating quiz folder: ', error);
            return;
        }
    }

    static async update_folder(token: string, name: string, folderId: string) {
        if (!token || !name || !folderId) {
            console.error('Insufficient data');
            return;
        }

        try {
            const { data } = await axios.put(`${UPDATE_FOLDER_URL}/${folderId}`, name, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return data.data;
            }
        } catch (error) {
            console.error('Error in updating folder: ', error);
            return;
        }
    }

    static async delete_fodler(token: string, folderId: string) {
        if (!token || !folderId) {
            console.error('Insufficient data');
            return;
        }

        try {
            const { data } = await axios.delete(`${DELETE_FOLDER_URL}/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return data.data;
            }
        } catch (error) {
            console.error('Error in deleting folder: ', error);
            return;
        }
    }

    static async get_folder_quizzes(token: string, folderId: string) {
        if (!token || !folderId) {
            console.error('Insufficient credentials');
            return;
        }

        try {
            const { data } = await axios.get(`${GET_FOLDER_QUIZ_URL}/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return data.data;
            }
        } catch (err) {
            console.error('Error in fetching quiz: ', err);
            return;
        }
    }

    static async get_all_quiz_folders(token: string) {
        if (!token) {
            console.error('Insufficient credentials');
            return;
        }

        try {
            const { data } = await axios.get(GET_QUIZ_FOLDERS_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                return data.data;
            }
        } catch (err) {
            console.error('Error in fetching folders: ', err);
            return;
        }
    }
}
