import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../storageLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('businessLogic-todos')
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodos(
    userId: string
): Promise<TodoItem[]> {

    logger.info(`Retrieving all todos for user ${userId}`, { userId })
    return await todosAccess.getTodosByUserId(userId)
}

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    const todoId = uuid.v4()

    const newItem: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...createTodoRequest
    }
    try {
        await todosAccess.createTodoItem(newItem)
        logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })
        return newItem
    } catch (error) {
        logger.error('Error occurred when creating user todo item')
        throw new Error (error)
    }
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<void> {
   
        const item = await todosAccess.getTodoItem(todoId)
        if (!item) throw new Error('Item not found')

        if (item.userId !== userId) {
            throw new Error('User is not authorized to update item')
        }

        await todosAccess.updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
        logger.info(`Updating todo ${todoId}`)
}

export async function deleteTodo(
    userId: string,
    todoId: string
): Promise<void> {
   
    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new Error('Item not found')

    if (item.userId !== userId) {
        logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
        throw new Error('User is not authorized to delete item')
    }
    await todosAccess.deleteTodoItem(todoId)
    logger.info(`Deleting todo ${todoId} for user ${userId}`)
    
}

export async function createAttachmentPresignedUrl(
    userId: string,
    todoId: string
): Promise<{ uploadUrl: string }> {
   
    const attachmentId = uuid.v4()
    const uploadUrl = attachmentUtils.getAttachmentUrl(attachmentId)

    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new Error('Item not found')

    if (item.userId !== userId) {
        throw new Error('User is not authorized to update item')
    }

    await todosAccess.updateAttachmentUrl(todoId, uploadUrl)

    logger.info(`Updating todo ${todoId} with attachment URL ${uploadUrl} for user ${userId}`)

    return { uploadUrl }
}