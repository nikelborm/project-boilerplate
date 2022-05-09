export enum AccessScopeType {
  ROUTE_VIEW = 'route/view',
  ROUTE_CREATE = 'route/create',
  ROUTE_DELETE = 'route/delete',

  CLIENT_VIEW = 'client/view',
  CLIENT_CREATE = 'client/create',
  CLIENT_EDIT = 'client/edit',
  CLIENT_APPROVE = 'client/approve',
  CLIENT_DELETE = 'client/delete',

  EVENT_EDIT = 'event/edit',

  EVENTPARAMETER_EDIT = 'eventParameter/edit',

  USER_VIEW = 'user/view',
  USER_EDIT_ALLEXCEPTPERMISSIONS = 'user/edit/allExceptPermissions',
  USER_EDIT_PERMISSIONS = 'user/edit/permissions',
  USER_CREATE = 'user/create',
  USER_DELETE = 'user/delete',

  HISTORY_MESSAGE = 'history/message',
  HISTORY_MESSAGE_ERROR = 'history/message/error',

  STREAM_MESSAGE = 'stream/message',
  STREAM_MESSAGE_ERROR = 'stream/message/error',
}

// route/view (смотреть граф роутов, на клиентов и их неподробное описание)
// client/view (смотреть список клиентов и конкретного клиента)
// client/create (добавлять клиентов)
// client/edit (менять название и описание клиента, менять название и описание его эндпоинтов)
// event/edit (изменять имя и описание события)
// eventParameter/edit (изменять имя и описание парамтера события)
// user/view (смотреть чужого пользователя и список пользователей вообще)
// user/edit (редактировать чужого пользователя: имя почта и такое)
// user/create (создавать нового пользователя)
// user/delete (удалять другого пользователя)
// user/changePermissions (менять права других пользователей или понижать себя)
