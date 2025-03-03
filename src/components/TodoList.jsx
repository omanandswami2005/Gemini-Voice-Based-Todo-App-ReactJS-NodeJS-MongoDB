// src/components/TodoList.jsx
import React, { useState, useEffect } from "react";
import { useLiveAPIContext } from "gemini-multimodal-live-voice-only";
import { createTodo, getTodos, updateTodo, deleteTodo } from "./api";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import RoboAvatar from "./RoboAvatar";

const TodoList = () => {
  const { connected, client, connect, disconnect, mute, unmute, muted, volume } = useLiveAPIContext();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos on mount
  useEffect(() => {
    loadTodos();
  }, [todos]);

  const [welcomeMessage, setWelcomeMessage] = useState("");

  useEffect(() => {
    fetch(import.meta.env.VITE_SERVER_URL) // adjust the URL if needed
      .then((response) => response.text())
      .then((data) => setWelcomeMessage(data))
      .catch((error) => console.error("Error fetching welcome message:", error));
  }, []);


 

  const loadTodos = async () => {
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Handle API calls dynamically via `client.on("toolcall")`
  useEffect(() => {
    const onToolCall = async (toolCall) => {
      console.log(toolCall.functionCalls);
      const responses = await Promise.all(
        toolCall.functionCalls.map(async (fc) => {
          switch (fc.name) {
            case "create_todo":
              return await handleCreate(fc);
            case "read_todos":
              return await handleRead(fc);
            case "update_todo":
              return await handleUpdate(fc);
            case "delete_todo":
              return await handleDelete(fc);
            default:
              return {
                id: fc.id,
                response: { output: { error: "Unknown function" } },
              };
          }
        })
      );
      client.sendToolResponse({ functionResponses: responses });
    };

    client.on("toolcall", onToolCall);
    return () => client.off("toolcall", onToolCall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // CRUD Function Handlers
  const handleCreate = async (fc) => {
    try {
      const data = await createTodo(fc.args.text);
      console.log(data);
      console.log(todos);
      setTodos([...todos, data]);
      return { id: fc.id, response: { output: data } };
    } catch (error) {
      return { id: fc.id, response: { output: { error: error.message } } };
    }
  };

  const handleRead = async (fc) => {
    try {
      const data = await getTodos();
      setTodos(data);
      return { id: fc.id, response: { output: data } };
    } catch (error) {
      return { id: fc.id, response: { output: { error: error.message } } };
    }
  };

  const handleUpdate = async (fc) => {
    try {
      const data = await updateTodo(
        fc.args.id,
        fc.args.text,
        fc.args.completed
      );
      setTodos(todos.map((todo) => (todo._id === data._id ? data : todo)));
      return { id: fc.id, response: { output: data } };
    } catch (error) {
      return { id: fc.id, response: { output: { error: error.message } } };
    }
  };

  const handleDelete = async (fc) => {
    try {
      await deleteTodo(fc.args.id);
      setTodos(todos.filter((todo) => todo._id !== fc.args.id));
      return {
        id: fc.id,
        response: { output: { message: "Deleted successfully" } },
      };
    } catch (error) {
      return { id: fc.id, response: { output: { error: error.message } } };
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3c72] to-[#2a5298]">
        
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gray-900 bg-opacity-50 backdrop-blur-xl p-8 rounded-xl shadow-2xl w-full max-w-lg"
      >
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-gray-100 text-center mb-6">
          Omiii's Todo Manager ✨
        </h1>

        <div className="flex items-center justify-center mb-6 gap-1">
          <button onClick={connected ? disconnect : connect} className={`bg-${connected ? "red" : "green"}-500 hover:bg-${connected ? "red" : "green"}-600 text-white font-bold py-2 px-4 rounded mx-9 cursor-pointer`}>
            {connected ? "Disconnect" : "Connect"}
          </button>

          <button onClick={muted ? unmute : mute} className={`bg-${muted ? "red" : "green"}-500 hover:bg-${muted ? "red" : "green"}-600 text-white font-bold py-2 px-4 rounded cursor-pointer mx-9`}>
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>


        {/* Connection Status */}
        <motion.p
  initial={{ opacity: 0, y: -5 }}
  animate={
    connected
      ? { opacity: 1, y: 0 }
      : { opacity: 1, y: 0, scale: [1, 1.02, 1] }
  }
  transition={
    connected
      ? { type: "tween", delay: 0.2, duration: 0.5 }
      : { delay: 0.2, duration: 1.5, repeat: Infinity, repeatType: "mirror" }
  }
  whileHover={{ scale: 1.02 }}
  className={`text-center text-lg font-semibold ${connected ? "text-green-400" : "text-red-400"}`}
>
  Voice Mode Connection: {connected ? "🟢 Online" : "🔴 Offline"}
</motion.p>

{welcomeMessage ?( <div className="text-white text-center">{welcomeMessage}</div> ):( <div className="text-white text-center">Connecting to Server, Please Wait...!</div> )}
        {/* Todo List */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-300 text-center mb-4">
            Todos
          </h2>
          <div className="overflow-hidden rounded-xl shadow-lg">
  <div className="max-h-60 overflow-y-auto">
    <table className="w-full bg-gray-900 text-gray-200">
      <thead className="sticky top-0 bg-gray-800">
        <tr>
          <th className="p-3 border-b border-gray-700">Sr No.</th>
          <th className="p-3 border-b border-gray-700">Todo</th>
          <th className="p-3 border-b border-gray-700">Completed</th>
          <th className="p-3 border-b border-gray-700">Delete</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        <AnimatePresence>
          {todos.map((todo, index) => (
            <motion.tr
              key={todo._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hover:bg-gray-700 transition-colors"
            >
              <td className="p-3 text-center">{index + 1}</td>
              <td className="p-3">{todo.text}</td>
              <td className="p-3 text-center">
                {todo.completed ? "✅" : "🚧"}
              </td>
              <td className="p-3 text-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Are you sure you want to delete "${todo.text}"?`
                    );
                    if (!confirmed) return;
                    await deleteTodo(todo._id);
                    loadTodos();
                  }}
                  className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  ❌
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
</div>

        </div>

        {/* Add Todo Input */}
        <div className="mt-6 flex items-center">
          <motion.input
            whileFocus={{
              scale: 1.05,
              boxShadow: "0 0 10px rgba(255,255,255,0.2)",
            }}
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none shadow-md"
            placeholder="New Todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 10px rgba(0, 153, 255, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await createTodo(newTodo);
              loadTodos();
              setNewTodo("");
            }}
            className="ml-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            ➕
          </motion.button>
        </div>
      </motion.div>

      <RoboAvatar active={connected} volume={volume} hover={false} />
      
    </div>
  );
};

export default TodoList;
