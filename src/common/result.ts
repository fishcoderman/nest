/**
 * 统一响应结果类
 */
export class Result<T = any> {
  /**
   * 状态码，200表示成功
   */
  code: number;

  /**
   * 响应消息
   */
  message: string;

  /**
   * 响应数据
   */
  data?: T;

  /**
   * 时间戳
   */
  timestamp: number;

  /**
   * 请求路径（可选）
   */
  path?: string;

  constructor(code: number, message: string, data?: T, path?: string) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
    this.path = path;
  }

  /**
   * 成功响应
   * @param data 响应数据
   * @param message 响应消息
   * @param path 请求路径
   * @returns Result实例
   */
  static success<T>(data?: T, message = '操作成功', path?: string): Result<T> {
    return new Result(200, message, data, path);
  }

  /**
   * 失败响应
   * @param message 错误消息
   * @param code 错误代码
   * @param path 请求路径
   * @returns Result实例
   */
  static error(message = '操作失败', code = 500, path?: string): Result<null> {
    return new Result(code, message, null, path);
  }

  /**
   * 分页成功响应
   * @param data 数据列表
   * @param pagination 分页信息
   * @param message 响应消息
   * @param path 请求路径
   * @returns Result实例
   */
  static paginate<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    },
    message = '查询成功',
    path?: string,
  ): Result<{ list: T[]; pagination: typeof pagination }> {
    return Result.success(
      {
        list: data,
        pagination,
      },
      message,
      path,
    );
  }

  /**
   * 参数错误响应
   * @param message 错误消息
   * @param path 请求路径
   * @returns Result实例
   */
  static badRequest(message = '参数错误', path?: string): Result<null> {
    return new Result(400, message, null, path);
  }

  /**
   * 未授权响应
   * @param message 错误消息
   * @param path 请求路径
   * @returns Result实例
   */
  static unauthorized(message = '未授权', path?: string): Result<null> {
    return new Result(401, message, null, path);
  }

  /**
   * 禁止访问响应
   * @param message 错误消息
   * @param path 请求路径
   * @returns Result实例
   */
  static forbidden(message = '禁止访问', path?: string): Result<null> {
    return new Result(403, message, null, path);
  }

  /**
   * 资源不存在响应
   * @param message 错误消息
   * @param path 请求路径
   * @returns Result实例
   */
  static notFound(message = '资源不存在', path?: string): Result<null> {
    return new Result(404, message, null, path);
  }

  /**
   * 资源冲突响应
   * @param message 错误消息
   * @param path 请求路径
   * @returns Result实例
   */
  static conflict(message = '资源冲突', path?: string): Result<null> {
    return new Result(409, message, null, path);
  }
}
