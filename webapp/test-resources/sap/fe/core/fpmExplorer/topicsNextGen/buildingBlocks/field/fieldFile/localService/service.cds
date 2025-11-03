using {TravelService.Travel} from '../../../../../service/service';

/*
 * Stream Content (as BLOB)
 */
@title         : 'Stream Content'
@Core.MediaType: 'application/octet-stream'
type Stream : LargeBinary;

extend entity Travel with {
  @title: 'Notes File'
  File     : Stream @(
    Core.MediaType                  : 'text/plain',
    Core.AcceptableMediaTypes       : ['text/plain'],
    Core.ContentDisposition.Filename: FileName
  );
  FileName : String;
};
