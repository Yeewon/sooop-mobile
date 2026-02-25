#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(KakaoShareBridge, NSObject)

RCT_EXTERN_METHOD(sendFeed:(NSString *)title
                  description:(NSString *)description
                  imageUrl:(NSString *)imageUrl
                  linkUrl:(NSString *)linkUrl
                  buttonTitle:(NSString *)buttonTitle
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
