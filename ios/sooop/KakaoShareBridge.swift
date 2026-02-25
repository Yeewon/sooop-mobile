import Foundation
import KakaoSDKShare
import KakaoSDKTemplate
import KakaoSDKCommon
import React

@objc(KakaoShareBridge)
class KakaoShareBridge: NSObject {

  @objc
  func sendFeed(
    _ title: String,
    description: String,
    imageUrl: String,
    linkUrl: String,
    buttonTitle: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let link = Link(
      webUrl: URL(string: linkUrl),
      mobileWebUrl: URL(string: linkUrl),
      iosExecutionParams: ["url": linkUrl]
    )

    let content = Content(
      title: title,
      imageUrl: URL(string: imageUrl)!,
      description: description,
      link: link
    )

    let feedTemplate = FeedTemplate(
      content: content,
      buttons: [
        Button(title: buttonTitle, link: link)
      ]
    )

    DispatchQueue.main.async {
      if ShareApi.isKakaoTalkSharingAvailable() {
        ShareApi.shared.shareDefault(templatable: feedTemplate) { sharingResult, error in
          if let error = error {
            reject("KAKAO_SHARE_ERROR", error.localizedDescription, error)
          } else if let sharingResult = sharingResult {
            UIApplication.shared.open(sharingResult.url, options: [:]) { success in
              if success {
                resolve(true)
              } else {
                reject("KAKAO_SHARE_ERROR", "Failed to open KakaoTalk", nil)
              }
            }
          }
        }
      } else {
        reject("KAKAO_NOT_INSTALLED", "카카오톡이 설치되어 있지 않아요", nil)
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
