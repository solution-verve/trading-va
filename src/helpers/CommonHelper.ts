export class CommonHelper {
  public static updatePayload = async (request: any): Promise<unknown> => {
    const headers = request?.headers?.authorization;
    if (headers) {
      return request.user;
    }

    return null;
  };
}
